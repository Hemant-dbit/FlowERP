from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission class: Only admin users can access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsManager(permissions.BasePermission):
    """
    Permission class: Only manager or admin users can access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager']


class IsEmployee(permissions.BasePermission):
    """
    Permission class: Any authenticated user (admin/manager/employee) can access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission: Users can only edit their own objects.
    Read permissions allowed for anyone.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions (GET, HEAD, OPTIONS) allowed for anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the owner
        # Assumes the object has a 'user' or 'created_by' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'assigned_to'):
            return obj.assigned_to == request.user
        
        return False


class CanManageProject(permissions.BasePermission):
    """
    Object-level permission: Only project manager or admin can modify project.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for project manager or admin
        return (
            request.user.role == 'admin' or 
            obj.manager == request.user
        )


class CanManageTask(permissions.BasePermission):
    """
    Object-level permission: Task creator, assignee, project manager, or admin can modify.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions for task stakeholders
        return (
            request.user.role == 'admin' or
            obj.created_by == request.user or
            obj.assigned_to == request.user or
            obj.project.manager == request.user
        )
