interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className={`tabs__tab ${tab.key === active ? "tabs__tab--active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
