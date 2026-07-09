import { iconType } from "../types";
import {
  SiTypescript,
  SiReact,
  SiPython,
  SiPytorch,
  SiPostgresql,
  SiDocker,
  SiAnthropic,
  SiFastapi,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { Brain } from "lucide-react";

const iconClass = "w-7 h-7 text-ink/90";

export const technologyIconList: iconType[] = [
  { name: "Python", icon: <SiPython className={iconClass} /> },
  { name: "PyTorch", icon: <SiPytorch className={iconClass} /> },
  { name: "TypeScript", icon: <SiTypescript className={iconClass} /> },
  { name: "React", icon: <SiReact className={iconClass} /> },
  { name: "Agents / LLM", icon: <Brain className={iconClass} strokeWidth={1.5} /> },
  { name: "Anthropic", icon: <SiAnthropic className={iconClass} /> },
  { name: "FastAPI", icon: <SiFastapi className={iconClass} /> },
  { name: "PostgreSQL", icon: <SiPostgresql className={iconClass} /> },
  { name: "Docker", icon: <SiDocker className={iconClass} /> },
  { name: "AWS", icon: <FaAws className={iconClass} /> },
];