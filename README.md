# Quick Draw Classification Frontend

A React-based web application for drawing sketches and classifying them using different machine learning models.

## Project Structure
```
ecs171-app-frontend/
├── src/
│   ├── components/
│   │   ├── DrawingCanvas.jsx    # Drawing canvas component
│   │   └── ui/                  # UI components
│   ├── App.jsx                  # Main application component
│   └── main.jsx                 # Application entry point
├── public/                      # Static assets
└── package.json                 # Project dependencies
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see backend README)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/winzyu/ecs171-app-frontend.git
   cd ecs171-app-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:5000
   ```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   # or
   yarn preview
   ```

## Features

- Real-time drawing canvas
- Multiple model selection (CNN, LSTM, MLP)
- Prediction confidence visualization
- Clean and responsive UI using shadcn/ui components

## Dependencies

- React 18
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## Git Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub:
   - Go to your repository on GitHub
   - Click "Pull requests"
   - Click "New pull request"
   - Select your feature branch
   - Click "Create pull request"

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
