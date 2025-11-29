export type EmptyProps = {
  description: string;
  icon?: React.ReactNode;
}

const Empty: React.FC<EmptyProps> = ({ description, icon }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-2">
        {icon}
        <p className="text-slate-500 mt-2">{description}</p>
      </div>
    </div>
  )
}

export default Empty;
