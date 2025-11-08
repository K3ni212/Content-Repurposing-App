import React from 'react';

interface StarIconProps {
  className?: string;
  filled?: boolean;
}

export const StarIcon: React.FC<StarIconProps> = ({ className = "w-5 h-5", filled = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.336 1.003l-4.12 3.575a.563.563 0 00-.162.524l1.257 5.273c.099.414-.42.755-.794.543l-4.912-2.922a.563.563 0 00-.527 0l-4.912 2.922c-.374.212-.893-.129-.794-.543l1.257-5.273a.563.563 0 00-.162-.524l-4.12-3.575c-.365-.34-.163-.963.336-1.003l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);
