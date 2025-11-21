// N-ary Tree Data Structure for File Explorer

export type NodeType = "folder" | "file";

export interface NodeMeta {
  mimeType?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
  preview?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  children: string[];
  meta: NodeMeta;
  deleted?: boolean; // For soft delete
}

export class FileSystemTree {
  private nodes: Map<string, FileNode>;
  private rootId: string;

  constructor() {
    this.nodes = new Map();
    this.rootId = "root";
    
    // Initialize with root folder
    const now = new Date().toISOString();
    this.nodes.set(this.rootId, {
      id: this.rootId,
      name: "Root",
      type: "folder",
      parentId: null,
      children: [],
      meta: {
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  getRootId(): string {
    return this.rootId;
  }

  getNode(id: string): FileNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): FileNode[] {
    return Array.from(this.nodes.values()).filter(node => !node.deleted);
  }

  getChildren(parentId: string): FileNode[] {
    const parent = this.nodes.get(parentId);
    if (!parent) return [];
    
    return parent.children
      .map(id => this.nodes.get(id))
      .filter((node): node is FileNode => node !== undefined && !node.deleted);
  }

  createNode(
    name: string,
    type: NodeType,
    parentId: string,
    meta?: Partial<NodeMeta>
  ): FileNode | null {
    const parent = this.nodes.get(parentId);
    if (!parent || parent.type !== "folder") return null;

    // Check for duplicate names in the same folder
    const siblings = this.getChildren(parentId);
    if (siblings.some(sibling => sibling.name === name)) {
      return null; // Name collision
    }

    const now = new Date().toISOString();
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newNode: FileNode = {
      id,
      name,
      type,
      parentId,
      children: [],
      meta: {
        createdAt: now,
        updatedAt: now,
        ...meta,
      },
    };

    this.nodes.set(id, newNode);
    parent.children.push(id);
    parent.meta.updatedAt = now;

    return newNode;
  }

  renameNode(id: string, newName: string): boolean {
    const node = this.nodes.get(id);
    if (!node || node.id === this.rootId) return false;

    // Check for duplicate names in the same folder
    const parent = this.nodes.get(node.parentId!);
    if (!parent) return false;

    const siblings = this.getChildren(node.parentId!);
    if (siblings.some(sibling => sibling.id !== id && sibling.name === newName)) {
      return false; // Name collision
    }

    node.name = newName;
    node.meta.updatedAt = new Date().toISOString();
    return true;
  }

  deleteNode(id: string): FileNode | null {
    if (id === this.rootId) return null;
    
    const node = this.nodes.get(id);
    if (!node) return null;

    // Soft delete
    node.deleted = true;
    node.meta.updatedAt = new Date().toISOString();

    // Remove from parent's children
    const parent = this.nodes.get(node.parentId!);
    if (parent) {
      parent.children = parent.children.filter(childId => childId !== id);
      parent.meta.updatedAt = new Date().toISOString();
    }

    // If it's a folder, soft delete all children recursively
    if (node.type === "folder") {
      this.softDeleteChildren(id);
    }

    return node;
  }

  private softDeleteChildren(parentId: string): void {
    const parent = this.nodes.get(parentId);
    if (!parent) return;

    parent.children.forEach(childId => {
      const child = this.nodes.get(childId);
      if (child) {
        child.deleted = true;
        if (child.type === "folder") {
          this.softDeleteChildren(childId);
        }
      }
    });
  }

  restoreNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;

    node.deleted = false;
    node.meta.updatedAt = new Date().toISOString();

    // Add back to parent's children
    const parent = this.nodes.get(node.parentId!);
    if (parent && !parent.children.includes(id)) {
      parent.children.push(id);
      parent.meta.updatedAt = new Date().toISOString();
    }

    // Restore children if it's a folder
    if (node.type === "folder") {
      this.restoreChildren(id);
    }

    return true;
  }

  private restoreChildren(parentId: string): void {
    const parent = this.nodes.get(parentId);
    if (!parent) return;

    parent.children.forEach(childId => {
      const child = this.nodes.get(childId);
      if (child) {
        child.deleted = false;
        if (child.type === "folder") {
          this.restoreChildren(childId);
        }
      }
    });
  }

  moveNode(nodeId: string, newParentId: string): boolean {
    if (nodeId === this.rootId) return false;
    
    const node = this.nodes.get(nodeId);
    const newParent = this.nodes.get(newParentId);
    
    if (!node || !newParent || newParent.type !== "folder") return false;
    if (nodeId === newParentId) return false;
    
    // Check if moving to descendant (would create cycle)
    if (this.isDescendant(newParentId, nodeId)) return false;

    // Check for name collision
    const newSiblings = this.getChildren(newParentId);
    if (newSiblings.some(sibling => sibling.name === node.name)) {
      return false;
    }

    // Remove from old parent
    const oldParent = this.nodes.get(node.parentId!);
    if (oldParent) {
      oldParent.children = oldParent.children.filter(id => id !== nodeId);
      oldParent.meta.updatedAt = new Date().toISOString();
    }

    // Add to new parent
    node.parentId = newParentId;
    newParent.children.push(nodeId);
    
    const now = new Date().toISOString();
    node.meta.updatedAt = now;
    newParent.meta.updatedAt = now;

    return true;
  }

  private isDescendant(potentialDescendantId: string, ancestorId: string): boolean {
    let current = this.nodes.get(potentialDescendantId);
    
    while (current && current.parentId) {
      if (current.parentId === ancestorId) return true;
      current = this.nodes.get(current.parentId);
    }
    
    return false;
  }

  search(query: string): FileNode[] {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return Array.from(this.nodes.values())
      .filter(node => 
        !node.deleted && 
        node.id !== this.rootId &&
        node.name.toLowerCase().includes(lowerQuery)
      );
  }

  getPath(nodeId: string): string {
    const parts: string[] = [];
    let current = this.nodes.get(nodeId);

    while (current && current.parentId !== null) {
      parts.unshift(current.name);
      current = this.nodes.get(current.parentId);
    }

    return "/" + parts.join("/");
  }

  // Persistence
  toJSON(): string {
    const data = {
      nodes: Array.from(this.nodes.entries()),
      rootId: this.rootId,
    };
    return JSON.stringify(data);
  }

  static fromJSON(json: string): FileSystemTree {
    const tree = new FileSystemTree();
    const data = JSON.parse(json);
    
    tree.nodes = new Map(data.nodes);
    tree.rootId = data.rootId;
    
    return tree;
  }
}

// Singleton instance with sample data
let fileSystemInstance: FileSystemTree | null = null;

export function getFileSystem(): FileSystemTree {
  if (!fileSystemInstance) {
    // Try to load from localStorage
    const saved = localStorage.getItem("fileSystem");
    if (saved) {
      try {
        fileSystemInstance = FileSystemTree.fromJSON(saved);
      } catch (e) {
        console.error("Failed to load file system from localStorage", e);
        fileSystemInstance = createSampleFileSystem();
      }
    } else {
      fileSystemInstance = createSampleFileSystem();
    }
  }
  return fileSystemInstance;
}

export function saveFileSystem(tree: FileSystemTree): void {
  localStorage.setItem("fileSystem", tree.toJSON());
}

function createSampleFileSystem(): FileSystemTree {
  const tree = new FileSystemTree();
  const rootId = tree.getRootId();

  // Create sample folders and files
  const documents = tree.createNode("Documents", "folder", rootId);
  const pictures = tree.createNode("Pictures", "folder", rootId);
  const downloads = tree.createNode("Downloads", "folder", rootId);

  if (documents) {
    tree.createNode("Resume.pdf", "file", documents.id, {
      mimeType: "application/pdf",
      size: 245760,
    });
    tree.createNode("Cover Letter.docx", "file", documents.id, {
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 32768,
    });
    
    const work = tree.createNode("Work", "folder", documents.id);
    if (work) {
      tree.createNode("Project Proposal.pdf", "file", work.id, {
        mimeType: "application/pdf",
        size: 512000,
      });
      tree.createNode("Meeting Notes.txt", "file", work.id, {
        mimeType: "text/plain",
        size: 4096,
      });
    }
  }

  if (pictures) {
    tree.createNode("Vacation 2024", "folder", pictures.id);
    tree.createNode("Family Photos", "folder", pictures.id);
    tree.createNode("Screenshot.png", "file", pictures.id, {
      mimeType: "image/png",
      size: 1048576,
    });
  }

  if (downloads) {
    tree.createNode("installer.exe", "file", downloads.id, {
      mimeType: "application/x-msdownload",
      size: 8388608,
    });
    tree.createNode("data.csv", "file", downloads.id, {
      mimeType: "text/csv",
      size: 16384,
    });
  }

  return tree;
}
