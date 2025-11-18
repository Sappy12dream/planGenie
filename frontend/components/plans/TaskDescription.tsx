'use client';

interface TaskDescriptionProps {
  description: string;
  isCompleted?: boolean;
}

export function TaskDescription({
  description,
  isCompleted = false,
}: TaskDescriptionProps) {
  // Parse the description to format it nicely
  const formatDescription = (text: string) => {
    // Split by lines
    const lines = text.split('\n');

    return lines
      .map((line, index) => {
        const trimmedLine = line.trim();

        // Skip empty lines
        if (!trimmedLine) return null;

        // Format **Option A/B/C** sections
        if (trimmedLine.match(/^\*\*Option [ABC]/)) {
          return (
            <div key={index} className="mt-3 mb-2">
              <strong className="text-slate-900">
                {trimmedLine.replace(/\*\*/g, '')}
              </strong>
            </div>
          );
        }

        // Format **Pro Tips** section
        if (trimmedLine.startsWith('**Pro Tips**:')) {
          return (
            <div key={index} className="mt-3 mb-1">
              <strong className="text-blue-700">Pro Tips:</strong>
            </div>
          );
        }

        // Format **Common Mistakes** section
        if (trimmedLine.startsWith('**Common Mistakes**:')) {
          return (
            <div key={index} className="mt-3 mb-1">
              <strong className="text-red-700">⚠️ Common Mistakes:</strong>
            </div>
          );
        }

        // Format any other **Bold** text
        if (trimmedLine.includes('**')) {
          const formatted = trimmedLine.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
          );
          return (
            <p
              key={index}
              className="mb-1 text-sm"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        }

        // Format numbered lists like (1), (2), (3)
        if (trimmedLine.match(/^\(\d+\)/)) {
          return (
            <li key={index} className="ml-4 text-sm">
              {trimmedLine.replace(/^\(\d+\)\s*/, '')}
            </li>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="mb-1 text-sm">
            {trimmedLine}
          </p>
        );
      })
      .filter(Boolean);
  };

  return (
    <div
      className={`space-y-1 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}
    >
      {formatDescription(description)}
    </div>
  );
}
