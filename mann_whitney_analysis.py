#!/usr/bin/env python3
"""
Compare Part 1 and Part 2 Google Form CSV responses with Mann-Whitney U tests.

Default usage:
    python3 mann_whitney_analysis.py

Optional usage:
    python3 mann_whitney_analysis.py part1.csv part2.csv
"""

from __future__ import annotations

import csv
import math
import sys
from pathlib import Path
from statistics import mean, median, stdev

try:
    from scipy import stats
except ImportError as exc:
    raise SystemExit(
        "This script needs scipy. Install it with: python3 -m pip install scipy"
    ) from exc


DEFAULT_PART1 = "減塑行動 Part 1 (回覆) - 表單回覆 1.csv"
DEFAULT_PART2 = "減塑行動 Part 2 (回覆) - 表單回覆 1.csv"
ITEM_NAMES = {
    "本週丟棄了多少個寶特瓶?": "plastic bottles",
    "本週丟棄了多少個塑膠袋?": "plastic bags",
    "本週丟棄了多少吸管/免洗餐具?(總和)": "straws/disposable tableware",
    "本週丟棄了多少塑膠杯/塑膠容器?": "plastic cups/containers",
    "本週丟棄了多少小塑膠垃圾(例如吸管套、塑膠包裝)?": "small plastic waste",
}


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))

    if not rows:
        raise ValueError(f"{path} has no response rows.")

    return rows


def waste_columns(rows: list[dict[str, str]]) -> list[str]:
    return [column for column in rows[0] if column.startswith("本週丟棄")]


def column_values(rows: list[dict[str, str]], column: str) -> list[float]:
    values = []
    for row_number, row in enumerate(rows, start=2):
        raw_value = row.get(column, "").strip()
        try:
            values.append(float(raw_value))
        except ValueError as exc:
            raise ValueError(
                f"Column {column!r}, CSV row {row_number} is not numeric: {raw_value!r}"
            ) from exc
    return values


def total_values(rows: list[dict[str, str]], columns: list[str]) -> list[float]:
    return [sum(column_values([row], column)[0] for column in columns) for row in rows]


def describe(values: list[float]) -> str:
    sd = stdev(values) if len(values) > 1 else math.nan
    return f"mean={mean(values):.2f}, median={median(values):.2f}, sd={sd:.2f}"


def print_test(label: str, part1: list[float], part2: list[float]) -> None:
    result = stats.mannwhitneyu(part1, part2, alternative="two-sided")
    p_value = result.pvalue
    is_significant = p_value < 0.05
    conclusion = "significant difference" if is_significant else "no significant difference"
    direction = "decrease" if median(part1) > median(part2) else "increase"

    print(f"\n[{label}]")
    print(f"Part 1: {describe(part1)}")
    print(f"Part 2: {describe(part2)}")
    print(f"Median {direction}: {abs(median(part1) - median(part2)):.2f}")
    print(f"U statistic: {result.statistic:.2f}")
    print(f"p-value: {p_value:.4f}")
    print(f"Conclusion: {conclusion}")


def main() -> int:
    if len(sys.argv) == 1:
        part1_path = Path(DEFAULT_PART1)
        part2_path = Path(DEFAULT_PART2)
    elif len(sys.argv) == 3:
        part1_path = Path(sys.argv[1])
        part2_path = Path(sys.argv[2])
    else:
        print("Usage: python3 mann_whitney_analysis.py [part1.csv part2.csv]")
        return 2

    part1_rows = load_rows(part1_path)
    part2_rows = load_rows(part2_path)
    part1_columns = waste_columns(part1_rows)
    part2_columns = waste_columns(part2_rows)
    common_columns = [column for column in part1_columns if column in part2_columns]

    if not common_columns:
        raise ValueError("No matching waste columns were found in the two CSV files.")

    print("Mann-Whitney U Test Results")
    print("=" * 30)
    print(f"Part 1 responses: {len(part1_rows)}")
    print(f"Part 2 responses: {len(part2_rows)}")

    part1_total = total_values(part1_rows, common_columns)
    part2_total = total_values(part2_rows, common_columns)
    print_test("Total plastic waste", part1_total, part2_total)

    print("\n[Results by item]")
    for column in common_columns:
        part1 = column_values(part1_rows, column)
        part2 = column_values(part2_rows, column)
        result = stats.mannwhitneyu(part1, part2, alternative="two-sided")
        p_value = result.pvalue
        item_name = ITEM_NAMES.get(column, column)
        status = (
            "significant decrease"
            if p_value < 0.05 and median(part1) > median(part2)
            else "no significant decrease"
        )
        print(
            f"- {item_name}: Part 1 median {median(part1):.2f}, "
            f"Part 2 median {median(part2):.2f}, p={p_value:.4f}, {status}"
        )

    print(
        "\nNote: Mann-Whitney U is a non-parametric test for two independent groups. "
        "It is useful when the two responses cannot be paired or when normality is uncertain."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
