import { iconType } from "../types";
import IconComponent from "../components/ui/IconComponent";
import {
  SiJavascript,
  SiTypescript,
  SiVuedotjs,
  SiReact,
  SiTailwindcss,
  SiExpress,
  SiMongodb,
  SiShadcnui,
  SiPython,
  SiTensorflow,
  SiPytorch,
  SiPostgresql,
  SiGooglecloud,
  SiSupabase,
  SiLangchain,
  SiMui,
  SiOpenai,
  SiAnthropic,
} from "react-icons/si";

import { FaAws, FaCloudflare } from "react-icons/fa";

const iconClassName = "text-secondary dark:text-neutral-200 w-10 h-10"; // Tailwind classes for color and size

export const technologyIconList: iconType[] = [
  {
    name: "JavaScript",
    icon: <IconComponent icon={<SiJavascript className={iconClassName} />} />,
  },
  {
    name: "TypeScript",
    icon: <IconComponent icon={<SiTypescript className={iconClassName} />} />,
  },
  {
    name: "Vue",
    icon: <IconComponent icon={<SiVuedotjs className={iconClassName} />} />,
  },
  {
    name: "React",
    icon: <IconComponent icon={<SiReact className={iconClassName} />} />,
  },
  {
    name: "Tailwind",
    icon: <IconComponent icon={<SiTailwindcss className={iconClassName} />} />,
  },
  {
    name: "Shadcn",
    icon: <IconComponent icon={<SiShadcnui className={iconClassName} />} />,
  },
  {
    name: "Mui",
    icon: <IconComponent icon={<SiMui className={iconClassName} />} />,
  },
  {
    name: "Express",
    icon: <IconComponent icon={<SiExpress className={iconClassName} />} />,
  },
  {
    name: "MongoDB",
    icon: <IconComponent icon={<SiMongodb className={iconClassName} />} />,
  },
  {
    name: "Python",
    icon: <IconComponent icon={<SiPython className={iconClassName} />} />,
  },
  {
    name: "TensorFlow",
    icon: <IconComponent icon={<SiTensorflow className={iconClassName} />} />,
  },
  {
    name: "PyTorch",
    icon: <IconComponent icon={<SiPytorch className={iconClassName} />} />,
  },
  {
    name: "OpenAI",
    icon: <IconComponent icon={<SiOpenai className={iconClassName} />} />,
  },
  {
    name: "Anthropic",
    icon: <IconComponent icon={<SiAnthropic className={iconClassName} />} />,
  },
  {
    name: "PostgreSQL",
    icon: <IconComponent icon={<SiPostgresql className={iconClassName} />} />,
  },
  {
    name: "AWS",
    icon: <IconComponent icon={<FaAws className={iconClassName} />} />,
  },
  {
    name: "Google Cloud",
    icon: <IconComponent icon={<SiGooglecloud className={iconClassName} />} />,
  },
  {
    name: "Cloudflare",
    icon: <IconComponent icon={<FaCloudflare className={iconClassName} />} />,
  },
  {
    name: "Supabase",
    icon: <IconComponent icon={<SiSupabase className={iconClassName} />} />,
  },
  {
    name: "Langchain",
    icon: <IconComponent icon={<SiLangchain className={iconClassName} />} />,
  },
];
