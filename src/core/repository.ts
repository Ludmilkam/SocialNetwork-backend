export class RepositoryError extends Error {}
export class NotFoundError extends RepositoryError {
    constructor() {
        super("Entity not found");
    }
}
export class AlreadyExistsError extends RepositoryError {
    constructor() {
        super("Entity already exists");
    }
}
