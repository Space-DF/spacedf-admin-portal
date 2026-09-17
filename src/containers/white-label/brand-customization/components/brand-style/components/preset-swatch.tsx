const PresetSwatch = ({ colors }: { colors: string[] }) => (
  <div className='grid shrink-0 grid-cols-2 gap-0.5 rounded-md border border-brand-component-stroke-dark-soft bg-white p-1'>
    {colors.slice(0, 4).map((color, idx) => (
      <span
        key={idx}
        style={{ backgroundColor: color }}
        className='size-2 rounded-full border border-brand-component-stroke-soft'
      />
    ))}
  </div>
);

export default PresetSwatch;
