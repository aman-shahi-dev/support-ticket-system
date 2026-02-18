from django.db.models import Avg, Count
from django.db.models.functions import TruncDate
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .llm import classify_ticket
from .models import Ticket
from .serializers import TicketSerializer


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category", "priority", "status"]
    search_fields = ["title", "description"]
    ordering = ["-created_at"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        qs = Ticket.objects.all()

        daily_counts = (
            qs.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .values("count")
        )
        avg_result = daily_counts.aggregate(avg=Avg("count"))

        priority_qs = qs.values("priority").annotate(count=Count("id"))
        priority_breakdown = {p["priority"]: p["count"] for p in priority_qs}
        for p in ["low", "medium", "high", "critical"]:
            priority_breakdown.setdefault(p, 0)

        category_qs = qs.values("category").annotate(count=Count("id"))
        category_breakdown = {c["category"]: c["count"] for c in category_qs}
        for c in ["billing", "technical", "account", "general"]:
            category_breakdown.setdefault(c, 0)

        return Response(
            {
                "total_tickets": qs.count(),
                "open_tickets": qs.filter(status="open").count(),
                "avg_tickets_per_day": round(avg_result["avg"] or 0, 1),
                "priority_breakdown": priority_breakdown,
                "category_breakdown": category_breakdown,
            }
        )


@api_view(["POST"])
def classify_view(request):
    description = request.data.get("description", "").strip()
    if not description:
        return Response(
            {"error": "description is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    return Response(classify_ticket(description), status=status.HTTP_200_OK)
