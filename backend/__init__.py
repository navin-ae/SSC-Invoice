"""Backend package for SSC Invoice backend.

Having an explicit package initializer avoids some import timing/context issues
when modules are imported both directly and via the package (helps uvicorn reload behavior).
"""
