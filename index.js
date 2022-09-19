import { hslToRgb } from './utils';

const WIDTH = 2000;
const HEIGHT = 2000;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = WIDTH;
canvas.height = HEIGHT;

let analyser, bufferLength;

const drawTimeData = (timeData) => {
  analyser.getByteTimeDomainData(timeData);

  context.clearRect(0, 0, WIDTH, HEIGHT);

  context.lineWidth = 10;
  context.strokeStyle = '#ffc600';
  context.beginPath();

  const sliceWidth = WIDTH / bufferLength;
  let x = 0;

  timeData.forEach((data, i) => {
    const v = data / 128;
    const y = (v * HEIGHT) / 2;

    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);

    x += sliceWidth;
  });

  context.stroke();

  requestAnimationFrame(() => drawTimeData(timeData));
};

const drawFreqData = (freqData) => {
  analyser.getByteFrequencyData(freqData);

  const barWidth = (WIDTH / bufferLength) * 2.5;

  let x = 0;
  freqData.forEach((amount) => {
    const percent = amount / 255;
    const [h, s, l] = [360 / (percent * 360) - 0.5, 0.75, 0.5];
    const [r, g, b] = hslToRgb(h, s, l);
    const barHeight = (HEIGHT * percent) / 2;

    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    context.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  });

  requestAnimationFrame(() => drawFreqData(freqData));
};

const getAudio = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2 ** 10;
  source.connect(analyser);

  bufferLength = analyser.frequencyBinCount;

  const timeData = new Uint8Array(bufferLength);
  const freqData = new Uint8Array(bufferLength);

  drawTimeData(timeData);
  drawFreqData(freqData);
};

getAudio();
