# Define the default target
.DEFAULT_GOAL := dev

# Define the dev target
dev:
	serve --port 3456

# Phony target to avoid conflicts with files of the same name
.PHONY: dev