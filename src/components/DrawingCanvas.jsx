import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, History, Loader2 } from 'lucide-react';

const QuickDrawCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [allStrokes, setAllStrokes] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [selectedModel, setSelectedModel] = useState('lstm');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const drawableItems = [
    { name: 'Bird', description: 'Any flying bird' },
    { name: 'Car', description: 'Side view of a car' },
    { name: 'Cat', description: 'A cat face or body' },
    { name: 'Clock', description: 'An analog clock' },
    { name: 'Dog', description: 'A dog face or body' },
    { name: 'Face', description: 'A human face' },
    { name: 'Fish', description: 'Any swimming fish' },
    { name: 'House', description: 'Simple house with roof' },
    { name: 'Sun', description: 'The sun, can include rays' },
    { name: 'Tree', description: 'Any type of tree' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set canvas size in layout
    canvas.style.width = '400px';
    canvas.style.height = '400px';
    // Set actual canvas resolution
    canvas.width = 400 * window.devicePixelRatio;
    canvas.height = 400 * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    // Scale context to match device pixel ratio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setContext(ctx);
  }, []);

  // [Previous event handlers remain the same]
  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    
    setCurrentStroke([{
      x: offsetX,
      y: offsetY,
      timestamp: Date.now()
    }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    
    context.lineTo(offsetX, offsetY);
    context.stroke();
    
    setCurrentStroke(prev => [...prev, {
      x: offsetX,
      y: offsetY,
      timestamp: Date.now()
    }]);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      context.closePath();
      setIsDrawing(false);
      
      if (currentStroke.length > 0) {
        setAllStrokes(prev => [...prev, currentStroke]);
        setCurrentStroke([]);
      }
    }
  };

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    if (e.touches) {
      return {
        offsetX: ((e.touches[0].clientX - rect.left) * scaleX) / window.devicePixelRatio,
        offsetY: ((e.touches[0].clientY - rect.top) * scaleY) / window.devicePixelRatio
      };
    }
    return {
      offsetX: ((e.nativeEvent.offsetX) * scaleX) / window.devicePixelRatio,
      offsetY: ((e.nativeEvent.offsetY) * scaleY) / window.devicePixelRatio
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setAllStrokes([]);
    setPrediction(null);
  };

  const saveToHistory = (imageData, result, model) => {
    setHistory(prev => [{
      id: Date.now(),
      image: imageData,
      result: result,
      model: model,
      strokes: allStrokes
    }, ...prev].slice(0, 32)); // Keep last 8 items
  };

  const loadHistoryItem = (item) => {
  // Clear canvas
  clearCanvas();
  
  // Reset context properties
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Load strokes and redraw
  setAllStrokes(item.strokes);
  
  // Redraw all strokes
  item.strokes.forEach(stroke => {
    if (stroke.length > 0) {
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      stroke.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.closePath(); // Explicitly close the path
    }
  });
  
  // Set other states
  setSelectedModel(item.model);
  setPrediction(item.result);
};

  const classifyDrawing = async () => {
    try {
      setLoading(true);
      setPrediction({ status: 'loading' });
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drawing: allStrokes,
          model_type: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      if (result.error) {
        setPrediction({ error: result.error });
      } else {
        setPrediction(result);
        // Save to history
        const canvas = canvasRef.current;
        const imageData = canvas.toDataURL('image/png');
        saveToHistory(imageData, result, selectedModel);
      }
    } catch (error) {
      console.error('Error classifying drawing:', error);
      setPrediction({ error: 'Failed to classify drawing' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 min-h-screen bg-yellow-300">
       <div className="flex gap-4 h-full p-4">
          {/* Left Panel - Drawable Items */}
          <Card className="w-64 bg-white shadow-md">
            <CardHeader className="p-3">
              <CardTitle className="text-base flex items-center gap-2">
                Drawable Items
                <Info className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div>
                {drawableItems.map((item) => (
                  <div key={item.name}>
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Center Area - Split into two cards */}
          <div className="flex-1 min-w-[600px] flex flex-col gap-4">
            {/* Drawing Controls Card */}
            <Card className="bg-white shadow-md">
              <CardHeader className="p-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Quick Draw</CardTitle>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lstm">LSTM Model</SelectItem>
                      <SelectItem value="cnn">CNN Model</SelectItem>
                      <SelectItem value="mlp">MLP Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex flex-col gap-3">
                  <div className="w-[400px] h-[400px] relative">
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 border border-gray-300 rounded-lg touch-none bg-white"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseOut={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={clearCanvas} 
                      variant="outline"
                      className="h-9 px-4"
                    >
                      Clear Canvas
                    </Button>
                    <Button 
                      onClick={classifyDrawing}
                      disabled={loading || allStrokes.length === 0}
                      className="h-9 px-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        `Classify with ${selectedModel.toUpperCase()}`
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

            {/* Prediction Results Card */}
          <Card className="w-64 bg-white shadow-md">
            <CardHeader className="p-3">
              <CardTitle className="text-base">Prediction Results</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {prediction && prediction.status === 'loading' && (
                <div className="text-center">
                  <p className="text-sm">Classifying drawing...</p>
                </div>
              )}
              
              {prediction && prediction.error && (
                <div className="text-center text-red-500">
                  <p className="text-sm">Error: {prediction.error}</p>
                </div>
              )}
              
              {prediction && !prediction.error && prediction.status !== 'loading' && (
                <div className="w-full">
                  <h3 className="text-sm font-semibold mb-2">
                    Prediction: {prediction.prediction}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Confidence: {(prediction.confidence * 100).toFixed(2)}%
                  </p>
                  <div>
                    <p className="text-sm font-semibold mb-2">All Probabilities:</p>
                    {Object.entries(prediction.probabilities)
                      .sort(([,a], [,b]) => b - a)
                      .map(([className, prob]) => (
                        <div key={className} className="flex justify-between text-sm py-0.5">
                          <span>{className}:</span>
                          <span>{(prob * 100).toFixed(2)}%</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - History */}
          <Card className="w-24 bg-white shadow-md">
            <CardHeader className="p-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <History className="h-4 w-4" />
                <span>History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-1 space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full aspect-square bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 hover:border-green-500 focus:outline-none focus:border-green-600"
                  >
                    <img
                      src={item.image}
                      alt="Historical prediction"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
       </div>
    </div>
  );
};

export default QuickDrawCanvas;
