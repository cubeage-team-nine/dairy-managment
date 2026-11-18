from datetime import date

from sqlalchemy.orm import Session

from app.modules.reports import repository


def _number(value):
    return float(value or 0)


def _record_data(report_type: str, row):
    if report_type == "animals":
        animal, farm_name, farmer_name = row
        return {
            "id": animal.id,
            "tag_number": animal.tag_number,
            "animal_type": animal.animal_type,
            "breed": animal.breed,
            "gender": animal.gender,
            "date_of_birth": animal.date_of_birth,
            "weight": _number(animal.weight) if animal.weight is not None else None,
            "status": animal.status,
            "farm_name": farm_name,
            "farmer_name": farmer_name,
        }

    if report_type in {"milk", "finance"}:
        record, animal_tag, farm_name, farmer_name = row
        return {
            "id": record.id,
            "record_date": record.record_date,
            "animal_tag": animal_tag,
            "morning_quantity": _number(record.morning_quantity),
            "evening_quantity": _number(record.evening_quantity),
            "total_quantity": _number(record.total_quantity),
            "fat": _number(record.fat) if record.fat is not None else None,
            "snf": _number(record.snf) if record.snf is not None else None,
            "milk_rate": _number(record.milk_rate) if record.milk_rate is not None else None,
            "milk_value": _number(record.milk_value),
            "farm_name": farm_name,
            "farmer_name": farmer_name,
        }

    if report_type == "feed":
        record, animal_tag, feed_type, farm_name, farmer_name = row
        return {
            "id": record.id,
            "record_date": record.record_date,
            "animal_tag": animal_tag,
            "feed_type": feed_type,
            "quantity": _number(record.quantity),
            "unit": record.unit,
            "farm_name": farm_name,
            "farmer_name": farmer_name,
        }

    if report_type == "health":
        record, animal_tag, farm_name, farmer_name = row
        return {
            "id": record.id,
            "visit_date": record.visit_date,
            "animal_tag": animal_tag,
            "disease": record.disease,
            "medicine": record.medicine,
            "dose": record.dose,
            "treatment": record.treatment,
            "doctor_recommendation": record.doctor_recommendation,
            "farm_name": farm_name,
            "farmer_name": farmer_name,
        }

    if report_type == "breeding":
        record, animal_tag, farm_name, farmer_name = row
        return {
            "id": record.id,
            "animal_tag": animal_tag,
            "lactation_number": record.lactation_number,
            "breed": record.breed,
            "ai_date": record.ai_date,
            "pregnancy_status": record.pregnancy_status,
            "pregnancy_confirmation_date": record.pregnancy_confirmation_date,
            "calving_date": record.calving_date,
            "farm_name": farm_name,
            "farmer_name": farmer_name,
        }

    record, animal_tag, farm_name, farmer_name = row
    return {
        "id": record.id,
        "animal_tag": animal_tag,
        "test_date": record.test_date,
        "test_name": record.test_name,
        "result": record.result,
        "treatment": record.treatment,
        "recovery_date": record.recovery_date,
        "follow_up_date": record.follow_up_date,
        "farm_name": farm_name,
        "farmer_name": farmer_name,
    }


def get_admin_report(
    db: Session,
    report_type: str,
    from_date: date | None = None,
    to_date: date | None = None,
):
    rows = repository.get_admin_report_rows(db, report_type, from_date, to_date)
    items = [_record_data(report_type, row) for row in rows]
    totals: dict[str, int | float] = {"records": len(items)}
    if report_type in {"milk", "finance"}:
        totals["milk_quantity"] = sum(row["total_quantity"] for row in items)
        totals["milk_income"] = sum(row["milk_value"] for row in items)
    elif report_type == "feed":
        quantity_by_unit: dict[str, float] = {}
        for item in items:
            quantity_by_unit[item["unit"]] = (
                quantity_by_unit.get(item["unit"], 0) + item["quantity"]
            )
        for unit, quantity in quantity_by_unit.items():
            totals[f"feed_quantity_{unit}"] = quantity
    return {
        "report_type": report_type,
        "items": items,
        "totals": totals,
        "from_date": from_date,
        "to_date": to_date,
    }
