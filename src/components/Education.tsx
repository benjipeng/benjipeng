import { educationType } from "../types";

export const Education = ({ school, years, description }: educationType) => {
  return (
    <div>
      <h3 className="text-xl inline">{school}</h3>
      <span className="text-sm text-gray-400"> ({years})</span>
      <p className="text-lg text-gray-400">{description}</p>
    </div>
  );
};
