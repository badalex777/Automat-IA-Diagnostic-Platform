import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ChevronRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { PIFResponse } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PIFRespondentListProps {
  responses: PIFResponse[];
  onViewDetail: (response: PIFResponse) => void;
  onDelete?: (id: string) => void;
}

export function PIFRespondentList({ responses, onViewDetail, onDelete }: PIFRespondentListProps) {
  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No responses yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {responses.map((response) => (
        <Card key={response.id} className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold" data-testid={`text-respondent-name-${response.id}`}>
                    {response.respondentName}
                  </h4>
                  <Badge variant="secondary" data-testid={`badge-respondent-role-${response.id}`}>
                    {response.respondentRole}
                  </Badge>
                </div>
                
                {response.respondentResponsibilities && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {response.respondentResponsibilities}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span data-testid={`text-response-date-${response.id}`}>
                    {response.completedAt ? format(new Date(response.completedAt), 'MMM d, yyyy') : 'In progress'}
                  </span>
                  {response.processClarity && (
                    <span>Process Clarity: {response.processClarity}</span>
                  )}
                  {response.changeMagnitude && (
                    <span>Change: {response.changeMagnitude}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetail(response)}
                  data-testid={`button-view-detail-${response.id}`}
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-delete-${response.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Response?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {response.respondentName}'s Process Insight Survey response. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(response.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
