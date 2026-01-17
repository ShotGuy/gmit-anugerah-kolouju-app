import { Button } from "@/components/ui/Button";

export default function CreateOrEditButton({
  label = "Simpan",
  isLoading = false,
  ...props
}) {
  return (
    <Button
      isLoading={isLoading}
      loadingText="Menyimpan..."
      type="submit"
      {...props}
    >
      {label}
    </Button>
  );
}
