/**
 * Clearpath Audit Protocol (CAP-1.0) — trust boundary creation and validation.
 */

import { randomUUID } from "crypto";
import type { TrustBoundary } from "../core/types";

export interface CreateTrustBoundaryInput {
  name: string;
  description: string;
  nodes: string[];
}

export function createTrustBoundary(input: CreateTrustBoundaryInput): TrustBoundary {
  return {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    nodes: [...input.nodes],
  };
}

/**
 * Validates that every node in nodeIds belongs to exactly one trust boundary,
 * and that boundaries fully cover all nodes with no overlap.
 */
export function validateBoundaryCoverage(
  nodeIds: string[],
  boundaries: TrustBoundary[]
): { valid: boolean; error?: string } {
  const nodeSet = new Set(nodeIds);
  const assigned = new Set<string>();
  for (const b of boundaries) {
    for (const nid of b.nodes) {
      if (!nodeSet.has(nid)) {
        return { valid: false, error: `Boundary "${b.name}" references unknown node ${nid}` };
      }
      if (assigned.has(nid)) {
        return { valid: false, error: `Node ${nid} belongs to more than one trust boundary` };
      }
      assigned.add(nid);
    }
  }
  for (const nid of nodeIds) {
    if (!assigned.has(nid)) {
      return { valid: false, error: `Node ${nid} does not belong to any trust boundary` };
    }
  }
  return { valid: true };
}
