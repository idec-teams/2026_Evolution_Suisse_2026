"""Keep the unlisted banner trial out of MkDocs' built-in search index."""

import json
from pathlib import Path

from mkdocs.plugins import event_priority


@event_priority(-50)  # Run after the search plugin has written its index.
def on_post_build(config):
    index_path = Path(config.site_dir) / "search" / "search_index.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    index["docs"] = [
        entry for entry in index["docs"]
        if not entry["location"].startswith("banner-preview/")
    ]
    index_path.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
