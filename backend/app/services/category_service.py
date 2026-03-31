"""Category service — business logic for category management."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate

# Default categories seeded for every new user
DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "icon": "utensils", "color": "#ff6b6b"},
    {"name": "Transport", "icon": "car", "color": "#feca57"},
    {"name": "Shopping", "icon": "shopping-bag", "color": "#a29bfe"},
    {"name": "Entertainment", "icon": "gamepad-2", "color": "#fd79a8"},
    {"name": "Bills & Utilities", "icon": "receipt", "color": "#00cec9"},
    {"name": "Health", "icon": "heart-pulse", "color": "#00b894"},
    {"name": "Education", "icon": "graduation-cap", "color": "#6c5ce7"},
    {"name": "Other", "icon": "layers", "color": "#636e72"},
]


class CategoryService:
    """Handles all category-related operations."""

    @staticmethod
    def seed_defaults(db: Session, user: User) -> list[Category]:
        """Create default categories for a newly registered user."""
        categories = []
        for cat_data in DEFAULT_CATEGORIES:
            category = Category(
                name=cat_data["name"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                is_default=True,
                user_id=user.id,
            )
            db.add(category)
            categories.append(category)
        db.commit()
        for c in categories:
            db.refresh(c)
        return categories

    @staticmethod
    def get_all(db: Session, user_id: int) -> list[Category]:
        """Return all categories for a user (default + custom)."""
        return (
            db.query(Category)
            .filter(Category.user_id == user_id)
            .order_by(Category.name)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, category_id: int, user_id: int) -> Category:
        """Return a single category by ID, scoped to user."""
        category = (
            db.query(Category)
            .filter(Category.id == category_id, Category.user_id == user_id)
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )
        return category

    @staticmethod
    def create(db: Session, data: CategoryCreate, user_id: int) -> Category:
        """Create a custom category for the user."""
        category = Category(
            name=data.name,
            icon=data.icon,
            color=data.color,
            is_default=False,
            user_id=user_id,
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def update(
        db: Session, category_id: int, data: CategoryUpdate, user_id: int
    ) -> Category:
        """Update a category's attributes."""
        category = CategoryService.get_by_id(db, category_id, user_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(category, field, value)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete(db: Session, category_id: int, user_id: int) -> None:
        """Delete a category if it has no expenses."""
        category = CategoryService.get_by_id(db, category_id, user_id)
        if category.expenses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete category with existing expenses",
            )
        db.delete(category)
        db.commit()
