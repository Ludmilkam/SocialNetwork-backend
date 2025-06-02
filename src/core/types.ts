export type FailedResponse = {
  success: false;
  message: string;
};

export type SuccededResponse<T> = {
  data: T;
  success: true;
};

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
