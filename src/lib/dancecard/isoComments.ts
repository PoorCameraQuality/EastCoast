export type IsoCommentRow = {
  id: string
  parentCommentId: string | null
  accountId: string
  authorSceneName: string
  body: string
  createdAt: string
  isMine: boolean
}

export type IsoCommentNode = IsoCommentRow & { replies: IsoCommentNode[] }

export function buildCommentTree(flat: IsoCommentRow[]): IsoCommentNode[] {
  const byId = new Map<string, IsoCommentNode>()
  const roots: IsoCommentNode[] = []

  for (const c of flat) {
    byId.set(c.id, { ...c, replies: [] })
  }

  for (const c of flat) {
    const node = byId.get(c.id)!
    if (c.parentCommentId && byId.has(c.parentCommentId)) {
      byId.get(c.parentCommentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
