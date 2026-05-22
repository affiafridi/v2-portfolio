export default function WorkDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  return <div>Work: {params.slug}</div>
}
