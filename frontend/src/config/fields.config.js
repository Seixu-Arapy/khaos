import {
  AcademicCapIcon,
  CodeBracketIcon,
  CubeIcon,
  PaintBrushIcon,
  ScissorsIcon,
  SignalIcon,
  SparklesIcon,
  Square2StackIcon,
  UserIcon
} from "@heroicons/react/24/solid"

export const FIELDS_CONFIG = {
  Artes: {
    icon: SparklesIcon,
    color: "red",
    classes: {
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      text: "text-red-400",
      muted: "text-red-400/60"
    }
  },
  Design: {
    icon: CubeIcon,
    color: "orange",
    classes: {
      border: "border-orange-500/20",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      muted: "text-orange-400/60"
    }
  },
  Caligrafia: {
    icon: PaintBrushIcon,
    color: "amber",
    classes: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      muted: "text-amber-400/60"
    }
  },
  Costura: {
    icon: ScissorsIcon,
    color: "lime",
    classes: {
      border: "border-lime-500/20",
      bg: "bg-lime-500/10",
      text: "text-lime-400",
      muted: "text-lime-400/60"
    }
  },
  Pessoal: {
    icon: UserIcon,
    color: "emerald",
    classes: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      muted: "text-emerald-400/60"
    }
  },
  Pesquisa: {
    icon: AcademicCapIcon,
    color: "teal",
    classes: {
      border: "border-teal-500/20",
      bg: "bg-teal-500/10",
      text: "text-teal-400",
      muted: "text-teal-400/60"
    }
  },
  Imagem: {
    icon: Square2StackIcon,
    color: "sky",
    classes: {
      border: "border-sky-500/20",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      muted: "text-sky-400/60"
    }
  },
  Som: {
    icon: SignalIcon,
    color: "blue",
    classes: {
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      muted: "text-blue-400/60"
    }
  },
  Programação: {
    icon: CodeBracketIcon,
    color: "indigo",
    classes: {
      border: "border-indigo-500/20",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      muted: "text-indigo-400/60"
    }
  }
}
