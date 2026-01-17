import ToggleInput from './ToggleInput';

// SwitchInput is an alias for ToggleInput to maintain backward compatibility
export default function SwitchInput(props) {
  return <ToggleInput {...props} />;
}