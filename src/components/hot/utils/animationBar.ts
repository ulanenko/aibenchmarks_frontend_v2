import { getColorClassSimple, getColorValue } from "@/lib/colors";
import { getGradientForAnimation } from "@/lib/colors";
import { CategoryColor } from "@/types/category";

/**
 * Creates a status bar element with optional animation
 * @param isAnimated Whether the bar should have an animated gradient
 * @param color Optional CategoryColor for customizing the animation gradient
 * @returns HTMLElement containing the status bar
 */
export const createStatusBar = (isAnimated: boolean,  color: CategoryColor): HTMLElement => {
    // Create a wrapper to center the bar
    const barWrapper = document.createElement('div');
    barWrapper.className = 'flex justify-center w-full py-1';
    
    const statusBar = document.createElement('div');
    const colorValue = getColorValue(color as CategoryColor,  'middle');
    statusBar.className = `h-2 w-28 rounded overflow-hidden`;
    statusBar.style.backgroundColor = colorValue;
    if (isAnimated) {
      // Add an animated gradient that moves horizontally
      const animatedGradient = document.createElement('div');
      
      // Use dynamic gradient if color is provided, otherwise fallback to blue
      animatedGradient.style.backgroundImage = getGradientForAnimation(color as CategoryColor);
  
      
      animatedGradient.className = 'h-full animated-gradient-bar';
      animatedGradient.style.width = '100%';
      
      statusBar.appendChild(animatedGradient);
    }
    
    barWrapper.appendChild(statusBar);
    return barWrapper;
  };
  