export default function TrafficMonitorPage() {
  return (
    <div className="w-full h-full min-h-screen bg-white">
      <iframe
        height="1000"
        src={`https://cloud.umami.is/share/${process.env.NEXT_UMAMI_WEBSITE_ID}`}
        style={{ border: 0 }}
        title="Traffic Monitor - Umami Analytics"
        width="100%"
      />
    </div>
  );
}
