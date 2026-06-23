export type CaptureMode = "video" | "audio";

export type MediaStreamOptions = {
  audioDeviceId?: string;
  videoDeviceId?: string;
  facingMode?: "user" | "environment";
};

function mapMediaError(err: unknown, mode: CaptureMode): Error {
  if (err instanceof DOMException) {
    const device = mode === "video" ? "câmara ou microfone" : "microfone";
    switch (err.name) {
      case "NotFoundError":
        return new Error(
          mode === "audio"
            ? "Nenhum microfone encontrado. Ligue um microfone e verifique em Definições → Som → Entrada."
            : "Nenhuma câmara encontrada. Ligue a câmara (USB, capture card ou telemóvel) e autorize o acesso."
        );
      case "NotAllowedError":
      case "PermissionDeniedError":
        return new Error(
          `Permissão de ${mode === "audio" ? "microfone" : "câmara/microfone"} negada. Autorize o acesso no browser.`
        );
      case "NotReadableError":
        return new Error(
          "O dispositivo está a ser usado por outra aplicação. Feche outras apps e tente novamente."
        );
      case "OverconstrainedError":
        return new Error(
          "O dispositivo selecionado não está disponível. Escolha outra câmara ou microfone."
        );
      case "SecurityError":
        return new Error(
          "Acesso bloqueado. Use HTTPS (obrigatório em telemóvel e produção)."
        );
      default:
        return new Error(err.message || `Erro ao aceder ao ${device}.`);
    }
  }

  if (err instanceof Error) return err;
  return new Error("Erro desconhecido ao aceder ao dispositivo de media.");
}

function assertSecureContext() {
  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    throw new Error(
      "Câmara e microfone exigem HTTPS em produção. Em telemóvel, aceda sempre por ligação segura."
    );
  }
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export async function listAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === "audioinput");
}

export async function listVideoInputDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === "videoinput");
}

async function tryGetUserMedia(
  constraints: MediaStreamConstraints
): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "NotFoundError" || err.name === "OverconstrainedError")
    ) {
      return null;
    }
    throw err;
  }
}

export async function primeMediaPermissions(
  mode: CaptureMode = "video"
): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) return;

  const constraints: MediaStreamConstraints =
    mode === "audio" ? { audio: true } : { video: true, audio: true };

  try {
    const temp = await navigator.mediaDevices.getUserMedia(constraints);
    temp.getTracks().forEach((t) => t.stop());
  } catch {
    /* labels may remain empty until user grants on start */
  }
}

export async function getAudioStream(deviceId?: string): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Browser não suporta captura de áudio.");
  }

  assertSecureContext();

  if (deviceId) {
    const stream = await tryGetUserMedia({
      audio: { deviceId: { ideal: deviceId } },
    });
    if (stream) return stream;
  }

  let devices = await listAudioInputDevices();
  if (devices.length === 0 || devices.every((d) => !d.label)) {
    await primeMediaPermissions("audio");
    devices = await listAudioInputDevices();
  }

  for (const device of devices) {
    if (!device.deviceId) continue;
    const stream = await tryGetUserMedia({
      audio: { deviceId: { ideal: device.deviceId } },
    });
    if (stream) return stream;
  }

  const fallbacks: MediaStreamConstraints[] = [
    { audio: { echoCancellation: true, noiseSuppression: true } },
    { audio: true },
  ];

  for (const constraints of fallbacks) {
    const stream = await tryGetUserMedia(constraints);
    if (stream) return stream;
  }

  throw new Error("Nenhum microfone encontrado.");
}

function buildVideoConstraints(options: MediaStreamOptions): MediaTrackConstraints {
  const base: MediaTrackConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  };

  if (options.videoDeviceId) {
    return { ...base, deviceId: { ideal: options.videoDeviceId } };
  }

  if (options.facingMode) {
    return { ...base, facingMode: { ideal: options.facingMode } };
  }

  return base;
}

export async function getVideoStream(
  options: MediaStreamOptions = {}
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Browser não suporta captura de vídeo.");
  }

  assertSecureContext();

  const videoConstraints = buildVideoConstraints(options);
  const audioConstraints = options.audioDeviceId
    ? { deviceId: { ideal: options.audioDeviceId } }
    : true;

  const attempts: MediaStreamConstraints[] = [
    { video: videoConstraints, audio: audioConstraints },
    { video: videoConstraints, audio: true },
    {
      video: options.videoDeviceId
        ? { deviceId: { ideal: options.videoDeviceId } }
        : options.facingMode
          ? { facingMode: options.facingMode }
          : true,
      audio: audioConstraints,
    },
    { video: true, audio: true },
  ];

  for (const constraints of attempts) {
    const stream = await tryGetUserMedia(constraints);
    if (stream) return stream;
  }

  throw new Error(
    "Nenhuma câmara disponível. Ligue uma câmara USB, capture card ou use a câmara do telemóvel."
  );
}

export async function getMediaStream(
  mode: CaptureMode,
  options: MediaStreamOptions = {}
): Promise<MediaStream> {
  try {
    if (mode === "audio") {
      return await getAudioStream(options.audioDeviceId);
    }
    return await getVideoStream(options);
  } catch (err) {
    throw mapMediaError(err, mode);
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
