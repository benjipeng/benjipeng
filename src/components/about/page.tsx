"use client";
import { useEffect } from "react";
import { Image } from "@nextui-org/react";
import { Avatar } from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";

import { Education } from "../Education";
import { iconType, educationType } from "@/types";

import { educationList, technologyIconList, whoAmIData } from "@/utils";
import IconComponent from "../ui/IconComponent";
import useAnimations from "@/utils/aboutAnimation";

const { fullName, profession, whoAmI, quote } = whoAmIData;

export default function About() {
  const animations = useAnimations();
  const whoAmIRef = animations.whoAmIAnimation();
  const professionRef = animations.professionAnimation();
  const quoteRef = animations.quoteAnimation();
  const techIconsRef = animations.techonologyIconListAnimation();
  const verticalImageRef = animations.verticalImageAnimation();
  const educationRef = animations.educationContentAnimation();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) {
      document.querySelectorAll(".mobile-animation").forEach((el) => {
        el.classList.remove("opacity-0");
      });
    }
  }, []);

  return (
    <div className="grid grid-rows-8 grid-cols-4 lg:grid-cols-3 gap-6">
      <Card className="col-span-full lg:row-start-2 lg:row-span-2 lg:col-start-2 lg:col-span-1 bg-neutral-100 dark:bg-neutral-800">
        <CardBody className="flex-col items-center justify-center gap-4 p-6">
          <Avatar
            src="https://res.cloudinary.com/aveg/image/upload/v1727985455/brutalist1_cp68e1.jpg"
            className="w-28 h-28 text-large brightness-90"
          />
          <h1 className="text-4xl font-bold text-center text-neutral-900 dark:text-neutral-50">
            {fullName}
          </h1>
        </CardBody>
      </Card>

      <Card
        ref={whoAmIRef}
        className="col-span-full lg:row-start-1 lg:row-span-1 lg:col-span-2 opacity-0 mobile-animation whoAmICard bg-primary-100 dark:bg-primary-800"
      >
        <CardBody className="gap-4 p-6">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
            Who am I?
          </h2>
          <p className="text-lg text-secondary-800 dark:text-secondary-100">
            {whoAmI}
          </p>
        </CardBody>
      </Card>

      <Card
        ref={professionRef}
        className="col-span-full row-start-2 row-end-3 lg:row-start-2 lg:col-start-1 lg:col-span-1 bg-secondary-200 dark:bg-secondary-700 opacity-0 mobile-animation professionCard"
      >
        <CardBody className="justify-center items-center p-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-secondary-900 dark:text-secondary-100">
            {profession}
          </h2>
        </CardBody>
      </Card>

      <Card
        ref={quoteRef}
        className="hidden lg:flex col-span-2 lg:row-start-3 lg:row-span-1 lg:col-start-3 lg:col-span-1 bg-accent-200 dark:bg-accent-700 opacity-0 mobile-animation quoteCard"
      >
        <CardBody className="justify-center items-center p-6">
          <p className="text-2xl font-bold text-center text-accent-900 dark:text-accent-100">
            &#34;{quote}&#34;
          </p>
        </CardBody>
      </Card>

      <Card
        ref={techIconsRef}
        className="col-span-full lg:row-start-3 lg:row-span-2 lg:col-start-1 lg:col-span-1 opacity-0 mobile-animation technologyIconList bg-neutral-50 dark:bg-neutral-900"
      >
        <CardBody className="gap-6 p-6 bg-secondary-600 dark:bg-secondary-900">
          <h2 className="text-3xl font-semibold text-neutral-300 dark:text-neutral-100">
            Fun Tools that I have worked with
          </h2>
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-6">
            {technologyIconList.map(({ name, icon }: iconType) => (
              <Tooltip key={`technology-item-${name}`} content={name}>
                <IconComponent icon={icon} />
              </Tooltip>
            ))}
          </div>
        </CardBody>
      </Card>

      <div
        ref={verticalImageRef}
        className="hidden lg:block lg:row-start-1 lg:row-span-2 lg:col-start-3 lg:h-[350px] rounded-xl relative opacity-0 mobile-animation verticalImage"
      >
        <Image
          src="https://res.cloudinary.com/aveg/image/upload/v1727985455/brutalist1_cp68e1.jpg"
          alt="profile image"
          className="object-cover rounded-xl"
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <Card
        ref={educationRef}
        className="col-span-full lg:row-start-4 lg:row-span-1 lg:col-start-2 lg:col-span-2 opacity-0 mobile-animation educationContent bg-secondary-100 dark:bg-secondary-800"
      >
        <CardBody className="gap-4 p-6">
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Education
          </h2>
          <div className="flex flex-col lg:flex-col gap-4">
            {educationList.map((education: educationType) => (
              <Education
                key={`education-item-${education.school}`}
                school={education.school}
                years={education.years}
                description={education.description}
              />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
