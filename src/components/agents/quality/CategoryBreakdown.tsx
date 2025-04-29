import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CategoryScore } from "@/types/codeQuality";
import { BookOpen, CircleCheck, ShieldCheck, AlertTriangle, Zap } from "lucide-react";

interface CategoryBreakdownProps {
  categories: CategoryScore[] | undefined | null; // Allow categories to be undefined or null initially
}

/**
 * Component displaying the score breakdown by categories
 */
const CategoryBreakdown = ({ categories }: CategoryBreakdownProps) => {
  // Map for icon components based on category names
  const getIconComponent = (name: string) => {
    switch (name.toLowerCase()) {
      case 'readability':
        return <BookOpen className="h-4 w-4 mr-2 text-squadrun-primary" />;
      case 'maintainability':
        return <CircleCheck className="h-4 w-4 mr-2 text-squadrun-primary" />;
      case 'performance':
        return <Zap className="h-4 w-4 mr-2 text-squadrun-primary" />;
      case 'security':
        return <ShieldCheck className="h-4 w-4 mr-2 text-squadrun-primary" />;
      case 'code smell':
        return <AlertTriangle className="h-4 w-4 mr-2 text-squadrun-primary" />;
      default:
        return <CircleCheck className="h-4 w-4 mr-2 text-squadrun-primary" />;
    }
  };

  return (
    <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50 col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add a check here: Ensure categories is an array before mapping */}
          {categories && Array.isArray(categories) && categories.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  {getIconComponent(category.name)}
                  <span className="text-sm text-white">{category.name}</span>
                </div>
                <span className="text-sm text-squadrun-gray">{category.score}/100</span>
              </div>
              <Progress
                value={category.score}
                className="h-2 bg-squadrun-darker"
              />
            </div>
          ))}
          {/* Optional: Add a loading or no data message if categories is not available */}
           {(!categories || !Array.isArray(categories) || categories.length === 0) && (
               <p className="text-squadrun-gray text-center">No category data available.</p>
           )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
