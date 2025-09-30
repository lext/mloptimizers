// Wait for page load
window.addEventListener('load', function() {
    console.log('Page loaded, starting initialization...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        return;
    }
    console.log('Chart.js loaded successfully');
    
    // Function to optimize: f(x) = (0.1x)² + 0.05cos(2πx)
    function f(x) {
        return Math.pow(0.1 * x, 2) + 0.05 * Math.cos(Math.PI * x * 2);
    }
    
    // Gradient: f'(x) = 2 * 0.1 * x * 0.1 - 0.05 * 2π * sin(2πx)
    // Simplified: f'(x) = 0.02x - 0.1π * sin(2πx)
    function grad_f(x) {
        return 0.02 * x - 0.1 * Math.PI * Math.sin(Math.PI * x * 2);
    }
    
    // Configuration
    const CONFIG = {
        maxIter: 50,
        initialX: -7.5,
        xRange: { min: -8, max: 2 },
        yRange: { min: -0.05, max: 0.7 },
        animationDelay: 100
    };
    
    // Generate smooth function data
    const functionData = [];
    for (let x = CONFIG.xRange.min; x <= CONFIG.xRange.max; x += 0.02) {
        functionData.push({x: x, y: f(x)});
    }
    
    // State management
    let state = {
        iteration: 0,
        animating: false,
        optimizers: {
            sgd: { x: CONFIG.initialX, history: [], losses: [] },
            momentum: { x: CONFIG.initialX, v: 0, history: [], losses: [] },
            adam: { x: CONFIG.initialX, m: 0, v: 0, history: [], losses: [] }
        }
    };
    
    // Initialize optimizer states
    function initializeOptimizers() {
        const initialY = f(CONFIG.initialX);
        state.optimizers.sgd = { x: CONFIG.initialX, history: [{x: CONFIG.initialX, y: initialY}], losses: [initialY] };
        state.optimizers.momentum = { x: CONFIG.initialX, v: 0, history: [{x: CONFIG.initialX, y: initialY}], losses: [initialY] };
        state.optimizers.adam = { x: CONFIG.initialX, m: 0, v: 0, history: [{x: CONFIG.initialX, y: initialY}], losses: [initialY] };
    }
    
    // Chart setup with high quality rendering
    const ctx = document.getElementById('chart').getContext('2d');
    
    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'f(x) = (0.1x)² + 0.05cos(2πx)',
                    data: functionData,
                    borderColor: 'rgb(75, 75, 75)',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0,
                    order: 4
                },
                {
                    label: 'SGD',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderWidth: 2,
                    pointRadius: [],
                    pointHoverRadius: 5,
                    showLine: true,
                    tension: 0,
                    order: 1
                },
                {
                    label: 'Momentum',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgb(54, 162, 235)',
                    borderWidth: 2,
                    pointRadius: [],
                    pointHoverRadius: 5,
                    showLine: true,
                    tension: 0,
                    order: 2
                },
                {
                    label: 'Adam',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgb(153, 102, 255)',
                    borderWidth: 2,
                    pointRadius: [],
                    pointHoverRadius: 5,
                    showLine: true,
                    tension: 0,
                    order: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false,
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: CONFIG.xRange.min,
                    max: CONFIG.xRange.max,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Parameter x',
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    min: CONFIG.yRange.min,
                    max: CONFIG.yRange.max,
                    ticks: {
                        stepSize: 0.1,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Function value f(x)',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 20,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += `(${context.parsed.x.toFixed(3)}, ${context.parsed.y.toFixed(4)})`;
                            return label;
                        }
                    }
                }
            },
            animation: {
                duration: 0
            },
            elements: {
                line: {
                    capBezierPoints: false
                }
            }
        }
    });
    
    // Optimization algorithms
    const optimizers = {
        sgd: {
            step: function(optState, lr) {
                const grad = grad_f(optState.x);
                optState.x = optState.x - lr * grad;
                const y = f(optState.x);
                optState.history.push({x: optState.x, y: y});
                optState.losses.push(y);
            }
        },
        momentum: {
            step: function(optState, lr, beta = 0.9) {
                const grad = grad_f(optState.x);
                optState.v = beta * optState.v - lr * grad;
                optState.x = optState.x + optState.v;
                const y = f(optState.x);
                optState.history.push({x: optState.x, y: y});
                optState.losses.push(y);
            }
        },
        adam: {
            step: function(optState, lr, beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
                const grad = grad_f(optState.x);
                const t = optState.history.length;
                
                optState.m = beta1 * optState.m + (1 - beta1) * grad;
                optState.v = beta2 * optState.v + (1 - beta2) * grad * grad;
                
                const m_hat = optState.m / (1 - Math.pow(beta1, t));
                const v_hat = optState.v / (1 - Math.pow(beta2, t));
                
                optState.x = optState.x - lr * m_hat / (Math.sqrt(v_hat) + eps);
                const y = f(optState.x);
                optState.history.push({x: optState.x, y: y});
                optState.losses.push(y);
            }
        }
    };
    
    // Chart update function
    function updateChart() {
        const datasets = chart.data.datasets;
        const optimizerNames = ['sgd', 'momentum', 'adam'];
        
        optimizerNames.forEach((name, index) => {
            const datasetIndex = index + 1; // Skip function dataset
            const optState = state.optimizers[name];
            
            // Update data
            datasets[datasetIndex].data = optState.history;
            
            // Update point radii (highlight last point)
            datasets[datasetIndex].pointRadius = optState.history.map((_, i) => 
                i === optState.history.length - 1 ? 4 : 1
            );
        });
        
        chart.update('none');
    }
    
    // Single optimization step
    function step() {
        if (state.iteration >= CONFIG.maxIter) return;
        
        const sgdLr = parseFloat(document.getElementById('sgd-lr').value);
        const momLr = parseFloat(document.getElementById('mom-lr').value);
        const adamLr = parseFloat(document.getElementById('adam-lr').value);
        
        optimizers.sgd.step(state.optimizers.sgd, sgdLr);
        optimizers.momentum.step(state.optimizers.momentum, momLr);
        optimizers.adam.step(state.optimizers.adam, adamLr);
        
        state.iteration++;
        updateMetrics();
        updateChart();
    }
    
    // Update metrics display
    function updateMetrics() {
        document.getElementById('iter').textContent = state.iteration;
        
        // Map optimizer names to HTML element IDs
        const optimizerMap = {
            'sgd': 'sgd-loss',
            'momentum': 'mom-loss', 
            'adam': 'adam-loss'
        };
        
        Object.keys(optimizerMap).forEach(name => {
            const optState = state.optimizers[name];
            const lossElement = document.getElementById(optimizerMap[name]);
            const lastLoss = optState.losses.length > 0 ? optState.losses[optState.losses.length - 1] : 0;
            lossElement.textContent = lastLoss.toFixed(6);
        });
    }
    
    // Reset optimization
    function reset() {
        state.iteration = 0;
        state.animating = false;
        initializeOptimizers();
        updateMetrics();
        updateChart();
        
        // Reset UI controls to default state
        document.getElementById('lock-lr').checked = true;
        ['sgd', 'mom', 'adam'].forEach(opt => {
            const slider = document.getElementById(`${opt}-lr`);
            const display = document.getElementById(`${opt}-lr-val`);
            slider.value = '0.1';
            display.textContent = '0.1';
        });
    }
    
    // Animation loop
    function animate() {
        if (!state.animating || state.iteration >= CONFIG.maxIter) {
            state.animating = false;
            return;
        }
        step();
        setTimeout(animate, CONFIG.animationDelay);
    }
    
    // Event listeners
    document.getElementById('run').addEventListener('click', () => {
        console.log('Run button clicked');
        state.animating = true;
        animate();
    });
    
    document.getElementById('step').addEventListener('click', () => {
        console.log('Step button clicked');
        step();
    });
    
    document.getElementById('reset').addEventListener('click', () => {
        console.log('Reset button clicked');
        reset();
    });
    
    // Learning rate synchronization
    function syncLearningRates(sourceSlider) {
        const lockCheckbox = document.getElementById('lock-lr');
        if (lockCheckbox.checked) {
            const value = sourceSlider.value;
            ['sgd', 'mom', 'adam'].forEach(opt => {
                const slider = document.getElementById(`${opt}-lr`);
                const display = document.getElementById(`${opt}-lr-val`);
                if (slider !== sourceSlider) {
                    slider.value = value;
                    display.textContent = value;
                }
            });
        }
    }
    
    // Learning rate display updates
    ['sgd', 'mom', 'adam'].forEach(opt => {
        const slider = document.getElementById(`${opt}-lr`);
        const display = document.getElementById(`${opt}-lr-val`);
        slider.addEventListener('input', () => {
            display.textContent = slider.value;
            syncLearningRates(slider);
        });
    });
    
    // Initialize application
    function initialize() {
        console.log('Initializing application...');
        try {
            initializeOptimizers();
            console.log('Optimizers initialized');
            updateMetrics();
            console.log('Metrics updated');
            updateChart();
            console.log('Chart updated');
            console.log('Application initialized successfully!');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }
    
    // Start the application
    initialize();
    
}); // End window load
