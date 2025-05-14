
export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "client";
};

export type RequestStatus = "pending" | "in-progress" | "completed" | "rejected";

export type RequestType = "card" | "post" | "edit" | "other";

export type Request = {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  clientId: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: "admin" | "client";
  createdAt: string;
};
