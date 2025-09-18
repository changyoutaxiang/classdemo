import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="w-full flex items-center justify-center mb-8">
      <p className="m-0 text-transparent text-3xl sm:text-5xl md:text-6xl font-serif font-bold uppercase animate-text bg-[url('https://plus.unsplash.com/premium_photo-1661882403999-46081e67c401?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y29kZXxlbnwwfHwwfHx8MA%3D%3D')] bg-contain bg-clip-text opacity-80">
        May the AI be with you
      </p>
    </div>
  );
};

// Demo component for usage
const DemoOne = () => {
  return <Component />;
};

export { DemoOne };