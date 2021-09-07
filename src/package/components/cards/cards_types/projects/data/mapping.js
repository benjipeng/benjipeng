import uuid from 'uuid/v4';
import moment from 'moment';

export const mapProjectsFromJsonResume = (jsonResume) => ({
    projects: jsonResume?.projects
        ?.map((project, index) => {
            const projectIndex = Number(project.index);
            return {
                ...project,
                // generating uuid for manipulating data if not present
                id: project.id || uuid(),
                date: project.endDate && moment(project.endDate, 'YYYY-MM-DD'),
                index: Number.isNaN(projectIndex) ? index : projectIndex
            };
        })
        .sort(({ index: a }, { index: b }) => a - b)
});

export const mapProjectToJsonResume = (project) => ({
    ...project,
    id: project.id || uuid(),
    endDate: project.date && project.date.format('YYYY-MM-DD')
});

export const updateProjectsArray = (newProject, jsonResume) => {
    if (!jsonResume.projects?.length) {
        return { projects: [newProject] };
    }
    const newProjects = [...jsonResume.projects].sort(({ index: a }, { index: b }) => a - b);
    if (!Number.isNaN(Number(newProject.index))) {
        newProjects[newProject.index] = newProject;
        return { projects: newProjects };
    }
    return { projects: newProjects.concat(newProject) };
};
