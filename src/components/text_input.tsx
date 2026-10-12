interface textInput {
  value: string;
  onChange: (value: string) => void;
}
export default function TextInput({ value, onChange }: textInput) {
  return (
    <div className="rounded-2xl border border-border bg-neutral-200 min-h-[350px] flex flex-col">
      {/* Your text input will go here */}
      <textarea
        name=""
        id=""
        className="w-full flex-1 bg-transparent p-4 text-xl text-foreground font-mono outline-none resize-none"
        rows={10}
        placeholder="Enter your text here"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      ></textarea>
      <span className=" p-2 font-mono text-neutral-400">
        {value.length} characters
      </span>
    </div>
  );
}
