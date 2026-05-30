import { Howl } from "howler";

const sounds = {
  boxOpen: new Howl({
    src: ["/sounds/box-open.mp3"],
    volume: 0.7,
  }),
  reveal: new Howl({
    src: ["/sounds/reveal.mp3"],
    volume: 0.8,
  }),
  banker: new Howl({
    src: ["/sounds/banker.mp3"],
    volume: 0.8,
  }),
  bigWin: new Howl({
    src: ["/sounds/big-win.mp3"],
    volume: 1,
  }),
  tension: new Howl({
    src: ["/sounds/tension.mp3"],
    volume: 0.5,
    loop: true,
  }),
};

export function playBoxOpen() {
  sounds.boxOpen.play();
}

export function playReveal() {
  sounds.reveal.play();
}

export function playBankerCall() {
  sounds.banker.play();
}

export function playBigWin() {
  sounds.bigWin.play();
}

export function startTensionLoop() {
  sounds.tension.play();
}

export function stopTensionLoop() {
  sounds.tension.stop();
}

export function speak(text: string) {
  if (typeof window === "undefined") {
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 0.7;
  utterance.volume = 1;

  const voices = synth.getVoices();
  const voice =
    voices.find((v) => v.name.includes("Google UK English Male")) ||
    voices.find((v) => v.name.includes("Male")) ||
    voices[0];

  if (voice) {
    utterance.voice = voice;
  }

  synth.speak(utterance);
}

export function speakBankerOffer(offer: number) {
  playBankerCall();

  setTimeout(() => {
    speak(
      `I would love to buy your box right now for ${offer.toLocaleString()} coins`
    );
  }, 1000);
}

export function speakFinalOffer(offer: number) {
  playBankerCall();

  setTimeout(() => {
    speak(`This is my final offer. ${offer.toLocaleString()} coins`);
  }, 1000);
}

export function speakSwapOffer() {
  playBankerCall();

  setTimeout(() => {
    speak("Would you like to swap your box?");
  }, 1000);
}

export function speakBigWin(prize: string, value: number) {
  playBigWin();

  setTimeout(() => {
    speak(
      `Congratulations! You have won ${prize} worth ${value.toLocaleString()} coins`
    );
  }, 1000);
}
