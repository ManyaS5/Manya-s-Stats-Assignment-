// Math Utility Functions
const factorial = (n) => {
    if (n < 0) return -1;
    if (n == 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
};

const nCr = (n, r) => {
    if (r < 0 || r > n) return 0;
    return factorial(n) / (factorial(r) * factorial(n - r));
};

// Hypergeometric Probability Mass Function
// P(X=x) = (KCx * (N-K)C(n-x)) / NCn
const hyperGeometricPMF = (N, K, n, x) => {
    const top = nCr(K, x) * nCr(N - K, n - x);
    const bottom = nCr(N, n);
    return bottom === 0 ? 0 : top / bottom;
};

// Poisson Probability Mass Function
// P(X=x) = (e^-lambda * lambda^x) / x!
const poissonPMF = (lambda, x) => {
    return (Math.exp(-lambda) * Math.pow(lambda, x)) / factorial(x);
};

// --- Chart.js Setup ---

// Hypergeometric Chart
const ctxHyper = document.getElementById('hyperChart').getContext('2d');
let hyperChart = new Chart(ctxHyper, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Probability P(X=x)',
            data: [],
            backgroundColor: 'rgba(76, 175, 80, 0.6)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, max: 1, title: { display: true, text: 'Probability' } },
            x: { title: { display: true, text: 'Number of Successes (x)' } }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

// Poisson Chart
const ctxPoisson = document.getElementById('poissonChart').getContext('2d');
let poissonChart = new Chart(ctxPoisson, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Probability P(X=x)',
            data: [],
            backgroundColor: 'rgba(33, 150, 243, 0.6)',
            borderColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, max: 0.5, title: { display: true, text: 'Probability' } },
            x: { title: { display: true, text: 'Number of Events (x)' } }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

// --- Update Functions ---

function updateHyper() {
    const N = parseInt(document.getElementById('paramN').value);
    const K = parseInt(document.getElementById('paramK').value);
    const n = parseInt(document.getElementById('paramn').value);

    // Update UI values
    document.getElementById('valN').innerText = N;
    document.getElementById('valK').innerText = K;
    document.getElementById('valn').innerText = n;

    // Constraints check
    if (K > N) { document.getElementById('paramK').value = N; return updateHyper(); }
    if (n > N) { document.getElementById('paramn').value = N; return updateHyper(); }

    const labels = [];
    const data = [];
    
    // x ranges from max(0, n - (N-K)) to min(n, K)
    const minX = Math.max(0, n - (N - K));
    const maxX = Math.min(n, K);

    for (let x = minX; x <= maxX; x++) {
        labels.push(x);
        data.push(hyperGeometricPMF(N, K, n, x));
    }

    hyperChart.data.labels = labels;
    hyperChart.data.datasets[0].data = data;
    hyperChart.update();

    // Explanation
    const explanation = document.getElementById('hyperExplanation');
    explanation.innerHTML = `
        <strong>Analysis:</strong> With a population of <strong>${N}</strong> and <strong>${K}</strong> successes, 
        if you pick <strong>${n}</strong> items, the most likely outcome is getting around <strong>${Math.round((n * K) / N)}</strong> successes.
        <br>Notice how the graph shifts as you change the parameters!
    `;
}

function updatePoisson() {
    const lambda = parseFloat(document.getElementById('paramLambda').value);
    
    // Update UI value
    document.getElementById('valLambda').innerText = lambda;

    const labels = [];
    const data = [];
    
    // Plot enough points to show the distribution (usually up to 3*lambda or at least 10)
    const limit = Math.max(10, Math.ceil(lambda * 2.5));

    for (let x = 0; x <= limit; x++) {
        labels.push(x);
        data.push(poissonPMF(lambda, x));
    }

    poissonChart.data.labels = labels;
    poissonChart.data.datasets[0].data = data;
    poissonChart.update();

    // Explanation
    const explanation = document.getElementById('poissonExplanation');
    let shape = lambda < 3 ? "skewed to the right (positive skew)" : "more symmetrical (bell-shaped)";
    explanation.innerHTML = `
        <strong>Analysis:</strong> With an average rate (λ) of <strong>${lambda}</strong>, the peak of the graph is near <strong>${Math.floor(lambda)}</strong>.
        <br>The shape is currently <strong>${shape}</strong>. As λ increases, it looks more like a Normal distribution!
    `;
}

// Event Listeners for Sliders
document.getElementById('paramN').addEventListener('input', updateHyper);
document.getElementById('paramK').addEventListener('input', updateHyper);
document.getElementById('paramn').addEventListener('input', updateHyper);
document.getElementById('paramLambda').addEventListener('input', updatePoisson);

// Initial Render
updateHyper();
updatePoisson();

// --- Quiz System ---

const quizzes = {
    'quiz-hyper': [
        { q: "In a Hypergeometric distribution, are trials independent?", options: ["Yes", "No", "Only if N is large"], ans: 1, sol: "No! Because we are sampling WITHOUT replacement, the result of one pick affects the probability of the next." },
        { q: "What does 'N' represent in the formula?", options: ["Sample size", "Number of successes", "Total population size"], ans: 2, sol: "Big N stands for the Total Population size." },
        { q: "If you have 10 balls (5 red, 5 blue) and pick 1 red, what is the chance the next is red?", options: ["5/10", "4/9", "5/9"], ans: 1, sol: "You took 1 red out. So 4 red remain out of 9 total. 4/9." },
        { q: "Which parameter is the 'Sample Size'?", options: ["N", "K", "n"], ans: 2, sol: "Little 'n' is the sample size (how many you pick)." },
        { q: "Hypergeometric is used for sampling...", options: ["With replacement", "Without replacement", "Infinite populations"], ans: 1, sol: "It is specifically for sampling WITHOUT replacement from a finite population." }
    ],
    'quiz-poisson': [
        { q: "What is the main parameter for Poisson?", options: ["Alpha", "Beta", "Lambda (λ)"], ans: 2, sol: "Lambda (λ) represents the average rate of occurrence." },
        { q: "Poisson models events that are...", options: ["Dependent", "Independent", "Correlated"], ans: 1, sol: "Events in a Poisson process are assumed to be independent of each other." },
        { q: "If λ = 4, what is the average number of events?", options: ["2", "4", "16"], ans: 1, sol: "Lambda IS the average. So it's 4." },
        { q: "Can Poisson be used for continuous data?", options: ["Yes", "No"], ans: 1, sol: "No, Poisson is a Discrete distribution (counts of events: 0, 1, 2...)." },
        { q: "Which is a good example of Poisson?", options: ["Coin flips", "Height of students", "Number of emails per hour"], ans: 2, sol: "Counting rare events (emails) over a fixed interval (hour) is classic Poisson." }
    ],
    'quiz-mixed1': [
        { q: "If N is very large (infinite), Hypergeometric approaches...", options: ["Poisson", "Binomial", "Normal"], ans: 1, sol: "It approaches Binomial because 'without replacement' doesn't matter much in a huge population." },
        { q: "Which distribution uses 'e' (Euler's number)?", options: ["Hypergeometric", "Poisson", "Both"], ans: 1, sol: "The Poisson formula uses e^(-λ)." },
        { q: "Drawing 5 cards from a deck is...", options: ["Hypergeometric", "Poisson", "Binomial"], ans: 0, sol: "Hypergeometric, because you don't put the cards back (without replacement)." },
        { q: "Number of typos on a page is...", options: ["Hypergeometric", "Poisson", "Binomial"], ans: 1, sol: "Poisson. Typos are rare events in a fixed space (the page)." },
        { q: "In Hypergeometric, can x be larger than n?", options: ["Yes", "No"], ans: 1, sol: "No. You can't have more successes (x) than the number of items you picked (n)." }
    ],
    'quiz-mixed2': [
        { q: "If λ = 3, what is P(X=0)?", options: ["0", "e^-3", "3 * e^-3"], ans: 1, sol: "Formula: (e^-3 * 3^0)/0! = e^-3 * 1 / 1 = e^-3." },
        { q: "Which distribution has a fixed number of trials?", options: ["Poisson", "Hypergeometric"], ans: 1, sol: "Hypergeometric has a fixed sample size 'n'. Poisson theoretically goes to infinity." },
        { q: "Mean of Poisson distribution is...", options: ["λ", "λ^2", "√λ"], ans: 0, sol: "The mean (and variance!) of a Poisson distribution is equal to λ." },
        { q: "Sampling 10 people from a town of 100...", options: ["Hypergeometric", "Binomial"], ans: 0, sol: "Finite population (100) without replacement = Hypergeometric." },
        { q: "Is 'Time between calls' a Poisson distribution?", options: ["Yes", "No"], ans: 1, sol: "No! The COUNT of calls is Poisson. The TIME between them is Exponential." }
    ],
    'quiz-mixed3': [
        { q: "Variance of Poisson is equal to...", options: ["Mean", "Standard Deviation", "0"], ans: 0, sol: "Unique property: Mean = Variance = λ." },
        { q: "Hypergeometric: N=20, K=10, n=5. Max value of x?", options: ["5", "10", "20"], ans: 0, sol: "Max x is min(n, K). min(5, 10) is 5." },
        { q: "Which is simpler to calculate for large N?", options: ["Hypergeometric", "Binomial"], ans: 1, sol: "Binomial is computationally simpler and is a good approximation." },
        { q: "Poisson shape for large λ?", options: ["Skewed Left", "Skewed Right", "Symmetric"], ans: 2, sol: "It becomes symmetric (Normal approximation)." },
        { q: "Can x be negative in either distribution?", options: ["Yes", "No"], ans: 1, sol: "No. You can't have negative counts of events or successes." }
    ]
};

function renderQuiz(id, questions) {
    const container = document.getElementById(id);
    let html = '';
    questions.forEach((item, index) => {
        html += `
            <div class="quiz-question" id="${id}-q${index}">
                <p><strong>Q${index + 1}:</strong> ${item.q}</p>
                <div class="quiz-options">
                    ${item.options.map((opt, i) => 
                        `<button onclick="checkAnswer('${id}', ${index}, ${i})">${opt}</button>`
                    ).join('')}
                </div>
                <div class="quiz-solution" id="${id}-sol${index}">
                    ${item.sol}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.checkAnswer = (quizId, qIndex, optIndex) => {
    const questionObj = quizzes[quizId][qIndex];
    const questionDiv = document.getElementById(`${quizId}-q${qIndex}`);
    const buttons = questionDiv.querySelectorAll('button');
    const solutionDiv = document.getElementById(`${quizId}-sol${qIndex}`);

    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    if (optIndex === questionObj.ans) {
        buttons[optIndex].classList.add('correct');
        buttons[optIndex].innerHTML += ' ✅';
    } else {
        buttons[optIndex].classList.add('incorrect');
        buttons[optIndex].innerHTML += ' ❌';
        buttons[questionObj.ans].classList.add('correct'); // Show correct one
    }

    // Show solution
    solutionDiv.style.display = 'block';
};

// Render all quizzes
for (const [id, questions] of Object.entries(quizzes)) {
    renderQuiz(id, questions);
}
