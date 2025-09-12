import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "icon";
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    icon: Icon,
    iconPosition = "left",
    fullWidth = false,
    children,
    className = "",
    ...props
}) => {
    const baseStyles =
        "font-medium transition-colors rounded-lg flex items-center justify-center gap-2";

    const variantStyles = {
        primary:
            "bg-blue-600 text-white hover:bg-blue-700 py-3 px-6 disabled:opacity-50",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6",
        outline:
            "border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 py-3 px-6",
        icon: "p-2 bg-blue-100 text-blue-600 hover:bg-blue-200",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${
                fullWidth ? "w-full" : ""
            } ${className}`}
            {...props}
        >
            {Icon && iconPosition === "left" && <Icon className="w-5 h-5" />}
            {children}
            {Icon && iconPosition === "right" && <Icon className="w-5 h-5" />}
        </button>
    );
};

export default Button;
