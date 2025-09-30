# ML Optimizers Comparison

An interactive visualization comparing different optimization algorithms: SGD, Momentum, and Adam.

## Live Demo

🌐 **[View the interactive demo](https://lext.github.io/mloptimizers/)**

## Features

- **Interactive Controls**: Adjust learning rates for each optimizer in real-time
- **Step-by-step Visualization**: Watch how each algorithm navigates the optimization landscape
- **Real-time Metrics**: Track loss values and iteration progress
- **Multiple Algorithms**: Compare SGD, Momentum, and Adam side-by-side

## How to Use

1. **Adjust Learning Rates**: Use the sliders to set different learning rates for each optimizer
2. **Step**: Click "Step" to advance one optimization step
3. **Run**: Click "Run" to automatically run all 50 iterations
4. **Reset**: Click "Reset" to start over from the initial position

## The Function

The optimization target is: `f(x) = (0.1x)² + 0.05cos(2πx)`

This function has:
- A global minimum at x = 0
- Local minima and maxima that create an interesting optimization landscape
- A starting point at x = -7.5 to demonstrate different convergence behaviors

## Algorithms Compared

### SGD (Stochastic Gradient Descent)
- Simple gradient descent with learning rate
- Can oscillate and converge slowly
- Sensitive to learning rate choice

### Momentum
- Adds velocity term to smooth out oscillations
- Uses exponential moving average of gradients
- Generally more stable than plain SGD

### Adam (Adaptive Moment Estimation)
- Combines momentum with adaptive learning rates
- Maintains separate estimates for first and second moments
- Often converges faster and more reliably

## Technical Details

- Built with vanilla JavaScript and Chart.js
- Responsive design that works on desktop and mobile
- High-quality rendering with smooth animations
- Real-time parameter updates and visualization
