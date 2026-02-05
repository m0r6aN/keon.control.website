import { fetchJson } from "./http";
import {
  ListWorkflowsResponseSchema,
  GetWorkflowVersionsResponseSchema,
  GetWorkflowVersionResponseSchema,
} from "../contracts/workflows";
import {
  CreateRunRequestSchema,
  CreateRunResponseSchema,
  GetRunResponseSchema,
  GetRunFindingsResponseSchema,
} from "../contracts/runs";

function kernelBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_KERNEL_BASE_URL;
  if (!v) throw new Error("Missing NEXT_PUBLIC_KERNEL_BASE_URL");
  return v;
}

export const kernelClient = {
  listWorkflows: () =>
    fetchJson({ baseUrl: kernelBaseUrl(), path: "/workflows" }, ListWorkflowsResponseSchema),

  getWorkflowVersions: (workflowId: string) =>
    fetchJson(
      { baseUrl: kernelBaseUrl(), path: `/workflows/${encodeURIComponent(workflowId)}/versions` },
      GetWorkflowVersionsResponseSchema
    ),

  getWorkflowVersion: (workflowId: string, version: string) =>
    fetchJson(
      {
        baseUrl: kernelBaseUrl(),
        path: `/workflows/${encodeURIComponent(workflowId)}/versions/${encodeURIComponent(version)}`,
      },
      GetWorkflowVersionResponseSchema
    ),

  createRun: (payload: unknown) => {
    const parsed = CreateRunRequestSchema.parse(payload);
    return fetchJson(
      { baseUrl: kernelBaseUrl(), path: "/runs", method: "POST", body: parsed },
      CreateRunResponseSchema
    );
  },

  getRun: (runId: string) =>
    fetchJson(
      { baseUrl: kernelBaseUrl(), path: `/runs/${encodeURIComponent(runId)}` },
      GetRunResponseSchema
    ),

  getRunFindings: (runId: string) =>
    fetchJson(
      { baseUrl: kernelBaseUrl(), path: `/runs/${encodeURIComponent(runId)}/findings` },
      GetRunFindingsResponseSchema
    ),
};

