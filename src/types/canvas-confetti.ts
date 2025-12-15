declare module "canvas-confetti" {
    interface ConfettiOptions {
      particleCount?: number;
      angle?: number;
      spread?: number;
      startVelocity?: number;
      decay?: number;
      gravity?: number;
      scalar?: number;
      drift?: number;
      origin?: {
        x?: number;
        y?: number;
      };
      ticks?: number;
      colors?: string[];
      shapes?: ("square" | "circle")[];
      disableForReducedMotion?: boolean;
    }
  
    function confetti(options?: ConfettiOptions): void;
  
    export default confetti;
  }