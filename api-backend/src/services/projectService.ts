// Temporary stub for projectService while googleapis issue is resolved

interface ProjectData {
  userId: string;
  className: string;
  createdAt: string;
  lastModified: string;
  markerObjects: any[];
  settings: {
    arEnabled: boolean;
    trackingMode: string;
  };
}

interface ProjectInfo {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
}

interface CreateProjectResult {
  projectId: string;
  projectFileId: string;
}

class ProjectServiceStub {
  async createProject(userId: string, className: string): Promise<CreateProjectResult> {
    throw new Error('Project service temporarily disabled - googleapis import issue');
  }

  async getProject(userId: string, className: string): Promise<ProjectData | null> {
    throw new Error('Project service temporarily disabled - googleapis import issue');
  }

  async updateProject(userId: string, className: string, projectData: Partial<ProjectData>): Promise<void> {
    throw new Error('Project service temporarily disabled - googleapis import issue');
  }

  async getUserProjects(userId: string): Promise<ProjectInfo[]> {
    throw new Error('Project service temporarily disabled - googleapis import issue');
  }

  async listUserProjects(userId: string): Promise<ProjectInfo[]> {
    throw new Error('Project service temporarily disabled - googleapis import issue');
  }

  async getProjectFolderId(userId: string, className: string): Promise<string> {
    throw new Error('Project service temporarily disabled - googleapis import issue');
  }

  async ensureProjectFolder(userId: string, className: string): Promise<string> {
    throw new Error('Project service temporarily disabled - googleapis import issue');
  }
}

export default new ProjectServiceStub();