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
declare class ProjectServiceStub {
    createProject(userId: string, className: string): Promise<CreateProjectResult>;
    getProject(userId: string, className: string): Promise<ProjectData | null>;
    updateProject(userId: string, className: string, projectData: Partial<ProjectData>): Promise<void>;
    getUserProjects(userId: string): Promise<ProjectInfo[]>;
    listUserProjects(userId: string): Promise<ProjectInfo[]>;
    getProjectFolderId(userId: string, className: string): Promise<string>;
    ensureProjectFolder(userId: string, className: string): Promise<string>;
}
declare const _default: ProjectServiceStub;
export default _default;
//# sourceMappingURL=projectService.d.ts.map