interface SessionPayload {
  id: string;
  username: string;
  name?: string;
  expiresAt: Date;
}

interface FormState {
  error: string | null;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemsPerPageOptions?: number[];
  className?: string;
  preserveParams?: Record<string, string | number | boolean | undefined>;
  labels?: {
    itemsLabel?: string;
    showingText?: string;
    displayingText?: string;
    ofText?: string;
    prevText?: string;
    nextText?: string;
  };
}
