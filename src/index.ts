import {load, Webcam} from '@teachablemachine/image';
import './style.css';
import { contentObj } from './conts';

const URL = process.env.NODE_ENV === 'development' ? '/model/' : `${process.env.PROD_BASE_URL}model/`

type Prediction = {
    className: string;
    probability: number;
};

let model: any,
    webcam: any,
    labelContainer: any,
    totalPredictionsQuantity: number,
    labels: string[],
    isPaused: boolean = false;

async function init() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    // Load the model and metadata
    model = await load(modelURL, metadataURL);
    totalPredictionsQuantity = model.getTotalClasses();
    labels = model.getClassLabels();

    // Setup the webcam
    const flip = true; // whether to flip the webcam
    //TODO: задавать размеры сразу с размером экрана
    webcam = new Webcam(200, 200, flip); // width, height, flip
    await webcam.setup({ facingMode: 'environment' }); // request access to the webcam

    // Append elements to the DOM
    //document.getElementById("webcam-container")?.appendChild(webcam.canvas); для отрисовки текста на canvas
    document.getElementById('webcam-container')?.appendChild(webcam.webcam);
    labelContainer = document.getElementById('label-container');
    for (let i = 0; i < totalPredictionsQuantity; i++) {
        // and class labels
        labelContainer.appendChild(document.createElement('div'));
    }

    let wc = document.getElementsByTagName('video')[0];
    wc.setAttribute('playsinline', String(true)); // written with "setAttribute" bc. iOS buggs otherwise :-)
    wc.muted = true;
    wc.id = 'webcamVideo';

    await webcam.play();

    // Start the loop
    window.requestAnimationFrame(loop);
}

async function loop() {
    if (!isPaused) {
        webcam.update(); // update the webcam frame
        await predict();
    }
    window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
    if (isPaused) return;
    // predict can take in an image, video or canvas html element
    const predictions: Prediction[] = await model.predict(webcam.canvas);
    const predictionsProbabilities = predictions.map(
        (prediction) => prediction.probability,
    );

    const maxProbability = Math.max(...predictionsProbabilities);

    if (maxProbability > 0.99) {
        isPaused = true; // pause the camera and data processing
        const maxProbabilityIndex =
            predictionsProbabilities.indexOf(maxProbability);

        const label = labels[maxProbabilityIndex];
        const content = contentObj[label];

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const element = doc.body.firstChild;

        const body = document.querySelector('body');

        // Переменная isPaused не всегда успевает обновляться, поэтому, чтобы избежать дублирования контента - делаем такую проверку. Эту проблему надо решить в будущем
        const isContentCreated = Boolean(document.querySelector('.content'));

        if (element && body && !isContentCreated) {
            body.appendChild(element);
            const closeButton = document.querySelector('.close img');
            closeButton?.addEventListener('click', () => {
                body.removeChild(element);
                resume();
            });
        }
    }
    for (let i = 0; i < totalPredictionsQuantity; i++) {
        const classPrediction =
            predictions[i].className +
            ': ' +
            predictions[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

function resume() {
    isPaused = false;
    window.requestAnimationFrame(loop);
}

// Initialize the app
void init();
