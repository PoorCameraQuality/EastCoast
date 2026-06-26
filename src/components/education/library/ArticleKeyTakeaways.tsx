type Props = {
  items: string[]
}

export default function ArticleKeyTakeaways({ items }: Props) {
  if (items.length === 0) return null

  return (
    <aside className="edu-takeaways" aria-labelledby="edu-takeaways-title">
      <h2 id="edu-takeaways-title" className="edu-takeaways-title">
        Key takeaways
      </h2>
      <ul className="edu-takeaways-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  )
}
