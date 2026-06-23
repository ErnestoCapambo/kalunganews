import { Info, Smartphone, Camera, Wifi } from "lucide-react";

export function LiveCompatibilityNotice() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm">
      <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <Info className="h-4 w-4 text-blue-400" />
        Compatibilidade de dispositivos
      </div>
      <ul className="space-y-3 text-muted-foreground">
        <li className="flex gap-2">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>
            <strong className="text-foreground/90">Telemóvel:</strong> funciona
            em Chrome/Safari (Android e iPhone) com HTTPS. Use câmara frontal ou
            traseira antes de iniciar.
          </span>
        </li>
        <li className="flex gap-2">
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>
            <strong className="text-foreground/90">Câmaras externas:</strong>{" "}
            USB, webcam, DSLR via capture card HDMI ou câmara do PC aparecem no
            seletor de câmara.
          </span>
        </li>
        <li className="flex gap-2">
          <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong className="text-foreground/90">Sem backend dedicado:</strong>{" "}
            a ligação é direta (WebRTC) via PeerJS — ideal para poucos
            espectadores. Não garante 100% em todas as redes; firewalls, 4G ou
            muitos viewers podem falhar. Para produção profissional, recomenda-se
            servidor de media (ex.: LiveKit, Mux ou YouTube Live).
          </span>
        </li>
      </ul>
    </div>
  );
}
