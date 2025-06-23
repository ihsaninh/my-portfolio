import { ResumeData } from '@/src/types/resume';

interface Props {
  data: ResumeData;
}

export default function ContentCard({ data }: Props) {
  return (
    <div className="p-8 bg-secondary rounded-lg">
      <div className="flex flex-col gap-4">
        <span className="text-accent text-sm">
          {data.startDate} - {data.endDate}
        </span>
        <h4 className="text-xl">{data.title}</h4>
        <div className="flex items-center">
          <span className="text-accent pr-2 text-3xl">•</span>
          <p className="text-sm">{data.company}</p>
        </div>
      </div>
    </div>
  );
}
