export type Facility = {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  status: "cold" | "introduced" | "interested" | "active";
  priority_score: number;
  next_follow_up_date: string;
  notes?: string;
};