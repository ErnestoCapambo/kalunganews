export type CaptureMode = "video" | "audio";

function mapMediaError(err: unknown, mode: CaptureMode): Error {
  if (err instanceof DOMException) {
    const device = mode === "video" ? "câmara ou microfone" : "microfone";
    switch (err.name) {
      case "NotFoundError":
        return new Error(
          mode === "audio"
            ? "Nenhum microfone encontrado. Ligue um microfone e verifique em Definições → Som → Entrada do Windows."
            : `Nenhum dispositivo de ${device} encontrado. Verifique as ligações e definições de som.`
        );
      case "NotAllowedError":
      case "PermissionDeniedError":
        return new Error(
          `Permissão de ${mode === "audio" ? "microfone" : "câmara/microfone"} negada. Autorize o acesso no ícone do browser, junto à barra de endereços.`
        );
      case "NotReadableError":
        return new Error(
          "O dispositivo está a ser usado por outra aplicação. Feche outras apps (Zoom, Teams, etc.) e tente novamente."
        );
      case "OverconstrainedError":
        return new Error(
          "O dispositivo selecionado não está disponível. Escolha outro microfone ou ligue um dispositivo de áudio."
        );
      case "SecurityError":
        return new Error(
          "Acesso bloqueado. O site precisa de HTTPS (ou localhost) para usar o microfone."
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
      "O microfone só funciona em HTTPS ou localhost. Aceda ao site por ligação segura."
    );
  }
}

export async function listAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];

  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === "audioinput");
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

export async function getAudioStream(deviceId?: string): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "O seu browser não suporta captura de áudio. Use Chrome, Edge ou Firefox atualizado."
    );
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
    try {
      const temp = await navigator.mediaDevices.getUserMedia({ audio: true });
      temp.getTracks().forEach((t) => t.stop());
      devices = await listAudioInputDevices();
    } catch (err) {
      throw mapMediaError(err, "audio");
    }
  }

  for (const device of devices) {
    if (!device.deviceId) continue;
    const stream = await tryGetUserMedia({
      audio: { deviceId: { ideal: device.deviceId } },
    });
    if (stream) return stream;
  }

  const fallbacks: MediaStreamConstraints[] = [
    {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    },
    { audio: true },
  ];

  for (const constraints of fallbacks) {
    const stream = await tryGetUserMedia(constraints);
    if (stream) return stream;
  }

  throw new Error(
    "Nenhum microfone encontrado. Ligue um microfone, defina-o como predefinido no Windows e recarregue a página."
  );
}

export async function getVideoStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "O seu browser não suporta captura de vídeo. Use Chrome, Edge ou Firefox atualizado."
    );
  }

  assertSecureContext();

  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: "user" }, audio: true },
    { video: true, audio: true },
    { video: { facingMode: { ideal: "user" } }, audio: true },
  ];

  for (const constraints of attempts) {
    const stream = await tryGetUserMedia(constraints);
    if (stream) return stream;
  }

  throw new Error(
    "Nenhuma câmara encontrada. Verifique se a câmara está ligada e autorize o acesso no browser."
  );
}

export async function getMediaStream(
  mode: CaptureMode,
  audioDeviceId?: string
): Promise<MediaStream> {
  try {
    if (mode === "audio") return await getAudioStream(audioDeviceId);
    return await getVideoStream();
  } catch (err) {
    throw mapMediaError(err, mode);
  }
}
